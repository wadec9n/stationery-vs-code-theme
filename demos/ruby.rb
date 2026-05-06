# frozen_string_literal: true

# Recipe builder DSL.
# Showcases blocks, modules, symbols, struct, keyword args,
# heredocs, and a touch of metaprogramming.

require "json"
require "set"

module Measurable
  UNITS = %i[g kg ml l tsp tbsp cup piece].freeze

  def self.included(base)
    base.extend(ClassMethods)
  end

  module ClassMethods
    def known_units = UNITS
  end

  def to_grams
    case unit
    when :kg  then quantity * 1_000
    when :g   then quantity
    when :tsp then quantity * 5
    when :tbsp then quantity * 15
    else
      raise ArgumentError, "Cannot convert #{unit.inspect} to grams"
    end
  end
end

Ingredient = Struct.new(:name, :quantity, :unit, keyword_init: true) do
  include Measurable

  def initialize(**)
    super
    raise ArgumentError, "unknown unit: #{unit}" unless UNITS.include?(unit)
  end

  def to_s = "#{quantity}#{unit} #{name}"
end

class Recipe
  attr_reader :title, :ingredients, :steps

  def self.define(title, &block)
    new(title).tap { |r| r.instance_eval(&block) }
  end

  def initialize(title)
    @title = title
    @ingredients = []
    @steps = []
    @tags = Set.new
  end

  def ingredient(name, quantity:, unit:)
    @ingredients << Ingredient.new(name: name, quantity: quantity, unit: unit)
  end

  def step(text) = @steps << text
  def tag(*names) = @tags.merge(names)

  def vegan? = @tags.include?(:vegan)

  def to_h
    {
      title: @title,
      tags: @tags.to_a.sort,
      ingredients: @ingredients.map { |i| { name: i.name, quantity: i.quantity, unit: i.unit } },
      steps: @steps,
    }
  end

  def render
    <<~MD
      # #{@title}

      **Tags:** #{@tags.to_a.join(", ")}

      ## Ingredients
      #{@ingredients.map { |i| "- #{i}" }.join("\n")}

      ## Steps
      #{@steps.each_with_index.map { |s, i| "#{i + 1}. #{s}" }.join("\n")}
    MD
  end
end

pancakes = Recipe.define("Fluffy Pancakes") do
  tag :breakfast, :vegetarian
  ingredient "flour",  quantity: 200,  unit: :g
  ingredient "milk",   quantity: 250,  unit: :ml
  ingredient "egg",    quantity: 2,    unit: :piece
  ingredient "butter", quantity: 30,   unit: :g

  step "Whisk dry ingredients in a bowl."
  step "Add wet ingredients and stir until just combined."
  step "Cook 2-3 minutes per side on medium heat."
end

puts pancakes.render
puts JSON.pretty_generate(pancakes.to_h)
